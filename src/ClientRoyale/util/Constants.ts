import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "node:http";
import type { URLSearchParams } from "node:url";
import type { ClientRoyale } from "..";
import type { APIRequest } from "../rest";
import type { FetchableStructure, Structure } from "../structures";

export const enum Constants {
	/**
	 * Default maximum time passed after the structure was last fetched before fetching again. (10 minutes)
	 */
	maxAge = 600_000,

	/**
	 * Default maximum time before cancelling a REST request. (10 seconds)
	 */
	AbortTimeout = 10_000,

	/**
	 * The base URL for the API
	 */
	APIUrl = "https://proxy.royaleapi.dev/v1",
}

/**
 * Any JSON data
 */
export type Json =
	| Json[]
	| boolean
	| number
	| string
	| { [property: string]: Json };

/**
 * A JSON object
 */
export type JsonObject = {
	[property: string]: Json;
};

/**
 * Options to fetch a structure
 */
export type FetchOptions = {
	/**
	 * Whether to skip the cache and fetch from the API
	 */
	force?: boolean;

	/**
	 * Maximum time (in milliseconds) passed after the structure was last fetched before fetching again
	 */
	maxAge?: number;
};

/**
 * The class of a fetchable structure
 */
export type ConstructableFetchableStructure = Omit<
	typeof FetchableStructure,
	"constructor"
> & {
	prototype: FetchableStructure;
	new (client: ClientRoyale, data: any, ...args: any[]): FetchableStructure;
};

/**
 * The options for a request
 */
export type RequestOptions = {
	/**
	 * Headers to be sent for this request
	 */
	headers?: OutgoingHttpHeaders;

	/**
	 * The query of this request
	 */
	query?: ConstructorParameters<typeof URLSearchParams>[0];

	/**
	 * The base url for this request
	 */
	url?: string;
};

/**
 * The status of a request to the API
 */
export enum RequestStatus {
	/**
	 * The request is pending
	 */
	Pending,

	/**
	 * The request is in progress
	 */
	InProgress,

	/**
	 * The request was successful
	 */
	Finished,

	/**
	 * The request failed
	 */
	Failed,
}

/**
 * A response received from the API
 */
export type Response = {
	/**
	 * The received data
	 */
	data: string | null;

	/**
	 * The status code received for this request
	 */
	statusCode: number;

	/**
	 * Headers received from the API
	 */
	headers: IncomingHttpHeaders;

	/**
	 * The status message received for this request
	 */
	status: string;

	/**
	 * The APIRequest object that instantiated this
	 */
	request: APIRequest;
};

/**
 * The path for a request to the API
 */
export type Path = `/${string}`;

/**
 * Options to instantiate a client
 */
export type ClientOptions = {
	/**
	 * The token of this client
	 * This defaults to `process.env.CLASH_ROYALE_TOKEN` if none is provided
	 */
	token?: Token;
};

/**
 * A valid token for the API
 */
export type Token = `${string}.${string}.${string}`;

/**
 * The role of a clan member
 */
export enum ClanMemberRole {
	/**
	 * The member is a member of the clan
	 */
	member,

	/**
	 * The member is an elder of the clan
	 */
	elder,

	/**
	 * The member is a co-leader of the clan
	 */
	coLeader,

	/**
	 * The member is the leader of the clan
	 */
	leader,
}

/**
 * A stringified id from the API
 */
export type StringId = `${number}`;

/**
 * The class of a structure
 */
export type ConstructableStructure = Omit<typeof Structure, "constructor"> & {
	prototype: Structure;
	new (client: ClientRoyale, data: any, ...args: any[]): Structure;
};

/**
 * The API type of a structure
 */
export type StructureType<T extends ConstructableStructure> = T extends new (
	client: ClientRoyale,
	data: infer R,
	...args: any[]
) => Structure
	? R
	: never;

/**
 * A JSON error received from the API
 */
export type ClashRoyaleError = {
	reason: string;
	message?: string;
	type?: string;
	detail?: Record<string, unknown>;
};

/**
 * Represents the type of a clan
 */
export enum ClanType {
	/**
	 * Clan is closed
	 */
	closed,

	/**
	 * The clan is invite only
	 */
	inviteOnly,

	/**
	 * The clan is open
	 */
	open,
}

export default Constants;