hassel_wasm_dbg
===============

This is a graphical debugger emulator for the homebrew Hasseldorf Computer that runs in a web browser
using Rust, WebAssembly, Typescript, React, and Redux.

## How to build

You will need the Rust compiler, Node, and NPM.

1. In the project root, run `make`.
2. In the `web/` directory, run `npm install && npm run build`

You should be able to load up `web/dist/index.html` in the web browser to see the results.

If you want to work more iteratively on the project, you can run `npm run start` from
the build directory to run a dev server that auto-refreshes on changes.

## License

Licensed under either of

 * Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any
additional terms or conditions.
