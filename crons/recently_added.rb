# stdlib
require 'thread'
require 'date'

# vendor
require 'bunny'
require 'json'

# project
require_relative '../lib/playlister'

recentlyAddedQueue = Playlister::MessageQueue::RecentlyAdded.new
recentlyAddedModel = Playlister::Model::RecentlyAdded.new
usersModel         = Playlister::Model::Users.new

recentlyAddedModel.all_enabled.each do |ra|
  userSession = usersModel.user ra['user_id']

  # send off to the queue system to handle this for us
  recentlyAddedQueue.send({:execute => 'trigger', :payload => userSession})
end
