# Vendor: sinatra
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/content_for'
require 'sinatra/namespace'
require 'sinatra/json'
require 'dalli'
require 'rack/session/dalli'

# Vendor: other
require 'rspotify'

# Local
require_relative '../lib/playlister'

# Sinatra setup
set :bind, '0.0.0.0'
set :port, 80
set :server, 'thin'
set :public_folder, 'public'
set :session_secret, '`d*-OYv.[(j,&{3VtU&kg4{)O4h8T94~J5Js^Y_?{2aM.5S_N.cmWaX%S$l9=ke%'
set :session, true

enable :sessions

configure do
  use Rack::Session::Dalli, cache: Dalli::Client.new

  scopes = 'playlist-modify-public playlist-modify-private playlist-read-private user-library-modify user-library-read user-read-private user-read-email'

  use OmniAuth::Strategies::Spotify, '4e39daff82e041eb819aa4f1a146980b', 'fa9ab3fa1a0a4fff95510374912fbc80', scope: scopes
end

helpers do
  def logged_in?
    session['id'] != nil
  end

  def force_logged_in
    unless logged_in?
      redirect '/auth/spotify'
    end
  end
end

before do
  if logged_in?
    @user = Playlister::Spotify::User.new session.to_hash

    # Playlister::Spotify::User.refresh_token_me(@user.id)
    # rescue RestClient::BadRequest => e
      # puts e.inspect
  end
end

# Home page
get '/' do
  erb :index
end

get '/auth/spotify/callback' do
  user = Playlister::Spotify::User.new(request.env['omniauth.auth'])

  # Save the whole sure hash to the session
  session.update user.to_hash

  redirect '/'
end

get '/tracks/recently_added' do
  erb :track_listing
end

namespace '/api' do
  namespace '/v1' do
    namespace '/user' do
      get '/verify' do
        json :status => logged_in?
      end

      post '/logout' do
        session.destroy

        json :status => session['id'] == nil
      end

      namespace '/playlist' do
        post '/recently_added/:action' do |action|
          recentlyAddedQueue = Playlister::MessageQueue::RecentlyAdded.new

          valid_actions = %w{trigger enable disable}

          recentlyAddedQueue.send({:execute => action, :payload => session.to_hash})
          json :status => true
        end

        get '/recently_added/:action' do |action|
          valid_actions = %w{list status}

          unless valid_actions.index(action)
            halt 404
          end

          case action
            when 'list'
              tracks = @user.saved_tracks_json(limit: 50)['items']
              return json({:status => true, :data => tracks})

            when 'status'
              recentlyAddedCollection = Playlister::DatabaseCollection::RecentlyAdded.new @user
              return json({:status => true, :data => recentlyAddedCollection.to_hash})

          end
        end
      end
    end
  end
end
