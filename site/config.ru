require 'sinatra'

set :env,  :production
disable :run

require_relative 'app.rb'

run Sinatra::Application
