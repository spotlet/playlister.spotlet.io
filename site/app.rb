# Vendor: sinatra
require 'sinatra'
require 'sinatra/reloader'
# require 'sinatra/content_for'
require 'sinatra/namespace'
require 'dalli'
require 'rack/session/dalli'

# Vendor: other
require 'rspotify'

# Sinatra setup
set :bind, '0.0.0.0'
set :port, 80
set :server, 'thin'
set :public_folder, 'public'
# set :session_secret, '`d*-OYv.[(j,&{3VtU&kg4{)O4h8T94~J5Js^Y_?{2aM.5S_N.cmWaX%S$l9=ke%'
set :session_secret, 'thisIsThie290ierewSkjfdsNNskksOOpp11'
set :session, true

enable :sessions

configure do
    use Rack::Session::Dalli, cache: Dalli::Client.new

    scopes = 'playlist-modify-public playlist-modify-private playlist-read-private user-library-modify user-library-read user-read-private user-read-email'

    use OmniAuth::Strategies::Spotify, '4e39daff82e041eb819aa4f1a146980b', 'fa9ab3fa1a0a4fff95510374912fbc80', scope: scopes
end

helpers do
    def logged_in?
        session[:display_name] != nil
    end

    def force_logged_in
        unless logged_in?
            redirect '/auth/spotify'
        end
    end
end

# Home page
get '/' do
    'Yup, you made it here'
end

get '/auth/spotify/callback' do
    user = RSpotify::User.new(request.env['omniauth.auth'])

    # Save the whole sure hash to the session
    session.update user.to_hash

    redirect '/test'
end

get '/test' do
    puts session.inspect

    user = RSpotify::User.new session.to_hash
    puts user.saved_tracks.first.inspect
end
