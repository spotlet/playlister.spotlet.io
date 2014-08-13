# stdlib
require 'thread'
require 'date'

# vendor
require 'bunny'
require 'json'

# project
require_relative '../lib/playlister'

recentlyAddedQueue = Playlister::MessageQueue::RecentlyAdded.new

recentlyAddedQueue.send({:execute => 'trigger', :payload => session.to_hash})
