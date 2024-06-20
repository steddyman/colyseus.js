import './legacy';

export { Client, JoinOptions } from './Client';
export { Protocol, ErrorCode } from './Protocol';
export { Room, RoomAvailable } from './Room';
export { Auth, type AuthSettings, type PopupSettings } from "./Auth";

/*
 * Serializers
 */
import { SchemaSerializer, getStateCallbacks } from "./serializer/SchemaSerializer";
import { NoneSerializer } from "./serializer/NoneSerializer";
import { registerSerializer } from './serializer/Serializer';

export { registerSerializer, SchemaSerializer, getStateCallbacks };
registerSerializer('schema', SchemaSerializer);
registerSerializer('none', NoneSerializer);
