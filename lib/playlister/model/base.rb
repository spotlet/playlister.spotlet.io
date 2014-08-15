
module Playlister
  module Model
    class Base
      attr_accessor :name, :database

      def initialize(name)
        @name = name
      end

      def collection
        @database.db()[@name]
      end
    end
  end
end
