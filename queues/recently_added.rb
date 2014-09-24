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

recentlyAddedQueue.queue.subscribe(:block => true) do |delivery_info, metadata, payload|
  data = JSON.parse payload
  data_action  = data['execute']
  data_payload = data['payload']

  user = Playlister::Spotify::User.new data_payload
  recentlyAddedModel = Playlister::Model::User::RecentlyAdded.new user

  case data_action
    when 'trigger'
      unless recentlyAddedModel.exists?
        playlist = user.create_playlist!('Recently Saved')
        recentlyAddedModel.save playlist.id
      end
      recentlyAddedModel.data.playlist.update_recently_saved user.saved_tracks(limit: 50)

    when 'enable'
      unless recentlyAddedModel.exists?
        playlist = user.create_playlist!('Recently Saved')
        recentlyAddedModel.save playlist.id
        recentlyAddedModel.data.playlist.set_tracks! user.saved_tracks(limit: 50)
      else
        recentlyAddedModel.enable
      end

    when 'disable'
      recentlyAddedModel.disable

  end
end
