require_relative 'spotify'
require_relative 'database'
require_relative 'model/base'
require_relative 'model/user'

module Playlister
  module Model
    class Users < Base
      def initialize
        @name     = 'users'
        @database = Database::Default.new
      end

      def user(user_id)
        collection().find_one({:user_id => user_id})
      end

      def user?(user_id)
        user(user_id) == nil
      end

      def add(user)
        collection().insert user.to_hash
      end

      def update(user)
        collection().update({:id => user.id}, user.to_hash)
      end
    end

    class RecentlyAdded < Base
      def initialize
        @name     = 'recently_added'
        @database = Database::Default.new
      end

      def all_enabled
        collection().find({:enabled => true}, :fields => [:user_id])
      end
    end

  end
end
