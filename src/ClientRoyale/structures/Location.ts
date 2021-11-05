import type { ClientRoyale } from "..";
import type { Path, FetchOptions } from "../util";
import type { APILocation } from "../APITypes";
import { FetchableStructure } from "./FetchableStructure";

/**
 * Represents a Clash Royale location.
 */
export class Location extends FetchableStructure<APILocation> {
	static id = "id";
	static route: Path = "/locations/:id";

	/**
	 * The location's name.
	 */
	name: string;

	/**
	 * The location's country code.
	 */
	countryCode?: string;

	/**
	 * If the location is a country.
	 */
	private _isCountry: boolean;

	/**
	 * @param client The client that instantiated this location
	 * @param data The data of this location
	 */
	constructor(client: ClientRoyale, data: APILocation) {
		super(client, data);

		this.name = data.name;
		this.countryCode = data.countryCode;
		this._isCountry = data.isCountry;
	}

	/**
	 * Checks if the location is a country.
	 * @returns Whether this location is a country
	 */
	isCountry(): this is this & { countryCode: string } {
		return this._isCountry;
	}

	/**
	 * Gets the JSON of this location.
	 * @returns The JSON representation of this location
	 */
	toJson(): APILocation {
		return {
			id: Number(this.id),
			name: this.name,
			countryCode: this.countryCode,
			isCountry: this._isCountry,
		};
	}

	/**
	 * Patch the location.
	 * @param data The data to update this location with
	 * @returns The updated location
	 */
	patch(data: Partial<APILocation>) {
		super.patch(data);

		if (data.name !== undefined) this.name = data.name;
		if (data.countryCode !== undefined) this.countryCode = data.countryCode;
		if (data.isCountry !== undefined) this._isCountry = data.isCountry;

		return this;
	}

	/**
	 * Gets a string representation of this location.
	 * @returns The name of this location
	 */
	toString() {
		return this.name;
	}

	/**
	 * Fetches this location.
	 * @returns A promise that resolves with this location
	 */
	fetch(options: FetchOptions): Promise<this> {
		return this.client.locations.fetch(this.id, options) as Promise<this>;
	}
}
