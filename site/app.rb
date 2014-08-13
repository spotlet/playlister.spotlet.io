# Vendor: sinatra
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/content_for'
require 'sinatra/namespace'
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

recentlyAddedQueue = Playlister::MessageQueue::RecentlyAdded.new

configure do
  use Rack::Session::Dalli, cache: Dalli::Client.new

  scopes = 'playlist-modify-public playlist-modify-private playlist-read-private user-library-modify user-library-read user-read-private user-read-email'

  use OmniAuth::Strategies::Spotify, '4e39daff82e041eb819aa4f1a146980b', 'fa9ab3fa1a0a4fff95510374912fbc80', scope: scopes
end

helpers do
  def logged_in?
    session['display_name'] != nil
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

  redirect '/tracks/recently_added'
end

get '/tracks/recently_added' do
  erb :track_listing
end

namespace '/api' do
  namespace '/v1' do
    get '/trigger/recently_added' do
      recentlyAddedQueue.send session.to_hash
    end
  end
end
