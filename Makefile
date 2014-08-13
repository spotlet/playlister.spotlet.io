
BUILD_NAME ?= main

COMPONENT ?= component
COMPONENTS = $(wildcard component/*)

app: component
	bundle exec ruby site/app.rb

.PHONY: component
component: $(COMPONENTS)
	$(COMPONENT) install
	$(COMPONENT) build --dev -o site/public/ -n $(BUILD_NAME)

clean:
	rm -f site/public/$(BUILD_NAME)*
	rm -rf components/
	rm -rf node_modules/
