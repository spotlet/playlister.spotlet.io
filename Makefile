
BUILD_NAME ?= main

COMPONENT ?= component
COMPONENTS = $(wildcard component/*)

.PHONY: component
component: $(COMPONENTS)

.PHONY: $(COMPONENTS)
$(COMPONENTS):
	$(COMPONENT) install
	$(COMPONENT) build -o public/ -n $(BUILD_NAME)

clean:
	rm -f public/$(BUILD_NAME)*
	rm -rf components/
	rm -rf node_modules/
