require 'ostruct'
require 'rspotify'

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
    end

    class User < RSpotify::User
      def saved_tracks(limit: 20, offset: 0)
        url = "me/tracks?limit=#{limit}&offset=#{offset}"
        json = User.oauth_get(@id, url)
        json['items'].map { |t| Track.new t }
      end
    end
  end
end
