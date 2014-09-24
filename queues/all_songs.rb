# stdlib
require 'thread'
require 'date'
require 'enumerator'

# vendor
require 'bunny'
require 'json'

# project
require_relative '../lib/playlister'

trap(:INT) { puts; exit }

allSongsQueue = Playlister::MessageQueue::AllSongs.new

allSongsQueue.queue.subscribe(:block => true) do |delivery_info, metadata, payload|
  data = JSON.parse payload
  data_artist  = data['artist']
  data_payload = data['payload']

  user = Playlister::Spotify::User.new data_payload

  artists = RSpotify::Artist.search(data_artist)
  am = artists.first

  singles = []
  all_tracks = []
  offset = 0
  albums = am.albums(limit: 50, offset: offset)
  while albums[:next] != nil do
    albums[:albums].each do |album|
      singles << album
    end

    offset = offset + 50
    albums = am.albums(limit: 50, offset: offset)
  end

  singles.each do |single|
    single.tracks.each do |track|
      track.artists.each do |artist|
        if artist.uri == am.uri
          all_tracks << track
        end
      end
    end
  end

  playlist = user.create_playlist!("#{data_artist} Songs")

  all_tracks.each_slice(50) do |s|
    playlist.add_tracks!(s)
  end
end
