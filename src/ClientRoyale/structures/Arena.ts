import type { ClientRoyale } from "..";
import type { APIArena } from "../APITypes";
import type { StringId } from "../util";
import { Structure } from "./Structure";

/**
 * A class representing an arena
 */
export class Arena extends Structure<APIArena> {
	static id = "id";

	/**
	 * The id of this arena
	 */
	readonly id: StringId;

	/**
	 * The name of the arena
	 */
	name: string;

	/**
	 * @param client - The client that instantiated this arena
	 * @param data - The data of the arena
	 */
	constructor(client: ClientRoyale, data: APIArena) {
		super(client, data);

		this.id = data.id.toString() as StringId;
		this.name = data.name;
	}

	/**
	 * Patches this arena.
	 * @param data - The data to update this arena with
	 * @returns The updated arena
	 */
	patch(data: APIArena): this {
		super.patch(data);

		this.name = data.name;
		return this;
	}

	/**
	 * Gets a JSON representation of this arena.
	 * @returns The JSON representation of this arena
	 */
	toJson(): APIArena {
		return {
			...super.toJson(),
			name: this.name,
			id: Number(this.id),
		};
	}

	/**
	 * Gets a string representation of this arena.
	 * @returns The name of this arena
	 */
	toString(): string {
		return this.name;
	}
}