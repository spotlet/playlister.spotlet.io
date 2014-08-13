require 'bunny'
require 'json'

module Playlister
  module MessageQueue

    class Base
      attr_reader :connection, :channel, :exchange

      attr_accessor :name

      def initialize(queue_name = nil)
        @connection = Bunny.new

        @connection.start
        @channel = @connection.create_channel

        if queue_name
          @name = queue_name
        end

        @exchange = @channel.default_exchange
      end

      def queue
        @channel.queue @name
      end

      def send(message)
        @exchange.publish message.to_json, :routing_key => @name
      end
    end

    class RecentlyAdded < Base
      attr_reader :name

      def initialize
        super('recently_added')
      end
    end
  end
end
