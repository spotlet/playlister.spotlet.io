require 'mongo'

module Playlister
  module Database

    class Base
      attr_accessor :client, :name

      def connection
        unless @client
          @client = Mongo::MongoClient.new
        end

        @client
      end

      def db
        connection()[@name]
      end
    end

    class Default < Base
      def initialize
        @name = 'default'
      end
    end

  end
end
