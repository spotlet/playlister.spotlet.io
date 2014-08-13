require_relative 'database'

module Playlister
  module DatabaseCollection

    class Base
      attr_accessor :name, :database

      def initialize(name)
        @name = name
      end

      def collection
        @database.db()[@name]
      end
    end

    class RecentlyAdded < Base
      attr_reader :name

      attr_accessor :username

      def initialize
        @name = 'recently_added'
        @database = Database::Default.new
      end

      def save(playlist_id)
        collection().insert({:username => @username, :playlist_id => playlist_id})
      end

      def delete(playlist_id)
      end
    end
  end
end
