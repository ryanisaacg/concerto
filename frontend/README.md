# Concerto

This is a monorepo containing everything for a multiplayer music webtoy. Check out [the deployed version](https://ryanisaacg.com/concerto).

- The `frontend/` is the meat of the app. Players select a location and may play notes on an octave of synthesized bells. Those notes then spread across the world, and other users hear the notes when they reach their own location. A ThreeJS-based visualizer shows the Earth as well as all currently spreading notes.
- The `backend/` is a small server in Rust that broadcasts messages between websocket clients. It allows each player to send and receive notes from other players.

