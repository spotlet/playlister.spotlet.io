require 'ostruct'
require 'json'
require 'rspotify'

RSpotify.authenticate('4e39daff82e041eb819aa4f1a146980b', 'fa9ab3fa1a0a4fff95510374912fbc80')

module RestClient
  def self.delete(url, payload='', headers={}, &block)
    Request.execute(:method => :delete, :url => url, :payload => payload, :headers => headers, &block)
  end
end

module RSpotify
  class Album
      def to_hash
        hash = {}
        instance_variables.each do |var|
          hash[var.to_s.delete('@')] = instance_variable_get(var)
        end
        hash
      end
  end

  class Track
      def to_hash
        hash = {}
        instance_variables.each do |var|
          hash[var.to_s.delete('@')] = instance_variable_get(var)
        end
        hash
      end
  end

  class Artist
    def albums(limit: 20, offset: 0)
      json = RSpotify.get("artists/#{@id}/albums?limit=#{limit}&offset=#{offset}")
      @albums = json['items'].map { |a| Album.new a }

      { :albums => @albums, :next => json['next'], :total => json['total'] }
    end
  end

  class Playlist
    def self.find_by_id(spotifyId)
      if spotifyId[/open.spotify.com/] != nil
        spotifyId.gsub!(/(http|https):\/\/open.spotify.com\//, '')
        spotifyId.gsub!(/\//, ':')
      elsif spotifyId[/spotify:/] != nil
        spotifyId.gsub!(/^spotify:/, '')
      end

      spotifyParams = {}

      parts = spotifyId.split ':'
      parts.each_index do |i|
        if i % 2 == 0
          spotifyParams[parts[i]] = ''
        else
          spotifyParams[parts[i-1]] = parts[i]
        end
      end

      Playlist.find spotifyParams['user'], spotifyParams['playlist']
    end

    def tracks(limit: 100, offset: 0)
      last_track = offset + limit - 1
      if @tracks_cache && last_track < 100
        return @tracks_cache[offset..last_track]
      end

      url = "users/#{@owner.id}/playlists/#{@id}/tracks" \
            "?limit=#{limit}&offset=#{offset}"

      json = RSpotify.auth_get(url)

      tracks = json['items'].map { |i| Track.new i['track'] }
      @tracks_cache = tracks if limit == 100 && offset == 0
      { :results => tracks, :next => json['next'], :limit => json['limit'] }
    end

    def set_tracks!(tracks, position: nil)
      if tracks.size > 100
        warn 'Too many tracks requested. Maximum: 100'
        return false
      end

      track_uris = tracks.map(&:uri).join(',')
      url = "users/#{@owner.id}/playlists/#{@id}/tracks?uris=#{track_uris}"
      url << "&position=#{position}" if position

      User.oauth_put(@owner.id, url, {})
      @tracks = nil
      tracks
    end

    def delete_tracks!(tracks)
      tracks_data = { :tracks => [] }
      tracks_data[:tracks] = tracks.map { |x| {:uri => x.uri} }

      url = "users/#{@owner.id}/playlists/#{@id}/tracks"

      User.oauth_delete(@owner.id, url, tracks_data.to_json)
    end

    def update_recently_saved(saved_tracks)
      saved_tracks_uris = saved_tracks.map(&:uri)

      current_tracks = tracks
      current_tracks_uris = current_tracks.map(&:uri)

      songs_add_uris = saved_tracks_uris.map { |x| x unless current_tracks_uris.include?(x) }
      songs_add_uris.compact!

      songs_add = saved_tracks.map { |x| x if songs_add_uris.include?(x.uri) }
      songs_add.compact!

      songs_delete_uris = current_tracks_uris.map { |x| x unless saved_tracks_uris.include?(x) }
      songs_delete_uris.compact!

      songs_delete = current_tracks.map { |x| x if songs_delete_uris.include?(x.uri) }
      songs_delete.compact!

      delete_tracks! songs_delete
      add_tracks! songs_add

      saved_tracks
    end

    # Returns a hash containing all user attributes
    def to_hash
      hash = {}
      instance_variables.each do |var|
        hash[var.to_s.delete('@')] = instance_variable_get(var)
      end
      hash
    end
  end
end

module Playlister
  module Spotify
    class Track < RSpotify::Track
      attr_accessor :other

      def initialize(options = {})
        super(options['track'])

        @other = OpenStruct.new({
          :added_at => options['added_at']
        })
      end

      # Returns a hash containing all user attributes
      def to_hash
        hash = {}
        instance_variables.each do |var|
          hash[var.to_s.delete('@')] = instance_variable_get(var)
        end
        hash
      end
    end

    class User < RSpotify::User
      def playlist(id)
        url = "users/#{@id}/playlists/#{id}"
        RSpotify::Playlist.new User.oauth_get(@id, url)
      end

      def saved_tracks(limit: 20, offset: 0)
        json = saved_tracks_json(limit: limit, offset: offset)
        json['items'].map { |t| Track.new t }
      end

      def saved_tracks_json(limit: 20, offset: 0)
        url = "me/tracks?limit=#{limit}&offset=#{offset}"
        json = User.oauth_get(@id, url)
        json
      end
    end
  end
end
