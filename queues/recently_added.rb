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

puts "before loop"

recentlyAddedQueue.queue.subscribe(:block => true) do |delivery_info, metadata, payload|
puts "after loop"
  data = JSON.parse payload
  data_action  = data['execute']
  data_payload = data['payload']

puts data_action

  user = Playlister::Spotify::User.new data_payload
  recentlyAddedCollection = Playlister::DatabaseCollection::RecentlyAdded.new user

  case data_action
    when 'trigger'
      unless recentlyAddedCollection.exists?
        playlist = user.create_playlist!('Recently Saved')
        recentlyAddedCollection.save playlist.id
      end
      recentlyAddedCollection.data.playlist.set_tracks! user.saved_tracks(limit: 50)

    when 'enable'
      unless recentlyAddedCollection.exists?
        playlist = user.create_playlist!('Recently Saved')
        recentlyAddedCollection.save playlist.id
        recentlyAddedCollection.data.playlist.set_tracks! user.saved_tracks(limit: 50)
      else
        recentlyAddedCollection.enable
      end

    when 'disable'
      recentlyAddedCollection.disable

  end
end
