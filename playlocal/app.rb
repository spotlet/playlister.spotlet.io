# Vendor: sinatra
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/namespace'
require 'sinatra/json'

require 'open-uri'
require 'net/http'
require 'enumerator'
require 'json'

get '/player/csrf' do
  response = open('https://playlister.spotilocal.com:4371/simplecsrf/token.json', 'Origin' => 'https://embed.spotify.com').read

  headers \
    "Access-Control-Allow-Origin" => "http://playlister.spotlet.io"

  json :data => JSON.parse(response)
end

get '/player/token' do
  response = open('http://open.spotify.com/token', 'Origin' => 'https://embed.spotify.com').read

  headers \
    "Access-Control-Allow-Origin" => "http://playlister.spotlet.io"

  json :data => JSON.parse(response)
end
