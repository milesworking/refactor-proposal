This proposes modularizing github event handling into `Handler` objects, e.g. `CheckRun` handler, `IssueComment` Handler, in the style of a Chain-of-Responsibility pattern.

The previous approach was singular function that hardcodes the exact if/else control flow and business logic for every event, which will get very long and complex and difficult to modify safely in the future as we add more events.

This version would result the main function being high-level and easy to understand, <20 lines, as we can simply use dependency-injection to add or remove event-handlers.

Functions that are specific to particular github events can be organized neatly with their Handler class as private methods, resulting in smaller files, easier to find things, lower namespace pollution, etc.

Probably this design is not exactly right and needs some modification to adapt to our use case, but something in this style seems scalable for the future.