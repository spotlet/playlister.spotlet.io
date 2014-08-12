# Vendor: sinatra
require 'sinatra'

# Vendor: other
require 'rspotify'

# Sinatra setup
set :bind, '0.0.0.0'
set :port, 80
set :server, 'thin'
set :public_folder, 'public'

# Home page
get '/' do
    puts 'Yup, you made it here'
end
