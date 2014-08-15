require 'ostruct'
require_relative '../database'

module Playlister
  module Model
    module User
      class RecentlyAdded < Playlister::Model::Base
        attr_reader :name, :user, :data

        def initialize(user)
          @name = 'recently_added'
          @database = Database::Default.new
          @user = user
          @loaded = false
        end

        def save(playlist_id)
          unless exists?
            collection().insert({:user_id => @user.id, :playlist_id => playlist_id, :enabled => true})
          end
        end

        def exists?
          true != data.marshal_dump.empty?
        end

        def data
          unless @loaded
            @data = collection().find_one({:user_id => @user.id})

            if @data == nil
              @data = {}
            else
              @loaded = true
            end

            if @data.has_key? 'playlist_id'
              @data['playlist'] = @user.playlist(@data['playlist_id'])
            end

            @data = OpenStruct.new @data
          end

          @data
        end

        def enable
          if exists?
            collection().update({:user_id => @user.id}, {:enabled => true})
          end
        end

        def disable
          if exists?
            collection().update({:user_id => @user.id}, {:enabled => false})
          end
        end

        def delete
          if exists?
            collection().remove({:user_id => @user.id})
          end
        end

        def to_hash
          temp = data.marshal_dump
          if data.playlist
            playlist = data.playlist.to_hash
            temp['playlist'] = playlist
          end
          temp
        end
      end
    end
  end
end
