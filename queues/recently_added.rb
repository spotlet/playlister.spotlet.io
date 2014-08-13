# stdlib
require 'thread'
require 'date'

# vendor
require 'bunny'
require 'json'

# project
require_relative '../lib/playlister'

trap(:INT) { puts; exit }

recentlyAddedQueue = Playlister::MessageQueue::RecentlyAdded.new
ra_coll = Playlister::DatabaseCollection::RecentlyAdded.new

recentlyAddedQueue.queue.subscribe(:block => true) do |delivery_info, metadata, payload|
  data = JSON.parse payload
  user = Playlister::Spotify::User.new data

  playlist = user.create_playlist!('Recently Saved')

  playlist.set_tracks! user.saved_tracks(limit: 50)
end
