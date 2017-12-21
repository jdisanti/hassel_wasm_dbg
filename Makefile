all:
	cargo +nightly build --release --target wasm32-unknown-unknown
	cp target/wasm32-unknown-unknown/release/hassel_wasm_dbg.wasm web/static
