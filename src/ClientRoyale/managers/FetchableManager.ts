import type {
	ConstructableFetchableStructure,
	FetchOptions,
	StructureType,
} from "../util";
import { Constants } from "../util";
import { Manager } from "./Manager";

/**
 * A manager that can fetch structures
 */
export class FetchableManager<
	T extends ConstructableFetchableStructure = ConstructableFetchableStructure
> extends Manager<T> {
	/**
	 * Fetches a structure from the API.
	 * @param id - The id of the structure to fetch
	 * @param options - The options for the fetch
	 * @returns A promise that resolves with the fetched structure
	 */
	async fetch(
		id: string,
		{ force = false, maxAge = Constants.maxAge }: FetchOptions = {}
	): Promise<this["structure"]["prototype"]> {
		const data = this.get(id);

		if (data && !force && Date.now() - data.lastUpdate.getTime() < maxAge)
			return data;
		return this.add(
			await this.client.rapi.get<StructureType<T>>(this.structure.path(id))
		);
	}
}
