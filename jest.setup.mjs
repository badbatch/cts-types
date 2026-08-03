/* eslint-disable unicorn/no-global-object-property-assignment */
import { TextDecoder, TextEncoder } from 'node:util';

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
