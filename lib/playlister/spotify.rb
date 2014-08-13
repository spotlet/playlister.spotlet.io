require 'ostruct'
require 'json'
require 'rspotify'

RSpotify.authenticate('4e39daff82e041eb819aa4f1a146980b', 'fa9ab3fa1a0a4fff95510374912fbc80')

module RSpotify
  class Playlist
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
      # def refresh_token
        # request_body = {
          # grant_type: 'refresh_token',
          # refresh_token: @credentials['refresh_token']
        # }
        # begin
          # response = RestClient.post(RSpotify::TOKEN_URI, request_body, RSpotify.send(:auth_header))
        # rescue RestClient::BadRequest => e
          # puts e.inspect
        # end
# puts response.inspect
        # json = JSON.parse(response)
# puts json.inspect
        # @credentials = json
      # end

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
