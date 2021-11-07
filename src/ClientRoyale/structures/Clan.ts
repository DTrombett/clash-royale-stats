import type { ClientRoyale } from "..";
import type { Path, FetchOptions } from "../util";
import type { APIClan, APITag } from "../APITypes";
import { getEnumString, ClanType } from "../util";
import { FetchableStructure } from "./FetchableStructure";
import { ClanMemberManager } from "../managers";
import { Location } from "./Location";

/**
 * A class representing a clan
 */
export class Clan extends FetchableStructure<APIClan> {
	static route: Path = "/clans/:id";

	/**
	 * The badge ID of the clan
	 */
	badge: number;

	/**
	 * The description of the clan
	 */
	description: string;

	/**
	 * The clan's donations per week
	 */
	donationsPerWeek: number;

	/**
	 * The location of the clan
	 */
	location: Location;

	/**
	 * The members of the clan
	 */
	members: ClanMemberManager;

	/**
	 * The name of the clan
	 */
	name: string;

	/**
	 * The required trophies to join the clan
	 */
	requiredTrophies: number;

	/**
	 * The clan's score
	 */
	score: number;

	/**
	 * The tag of the clan
	 */
	tag: APITag;

	/**
	 * The type of the clan
	 */
	type: ClanType;

	/**
	 * The clan's trophies in the war
	 */
	warTrophies: number;

	/**
	 * @param client - The client that instantiated this clan
	 * @param data - The data of the clan
	 */
	constructor(client: ClientRoyale, data: APIClan) {
		super(client, data);

		this.tag = data.tag;
		this.name = data.name;
		this.type = ClanType[data.type];
		this.description = data.description;
		this.badge = data.badgeId;
		this.score = data.clanScore;
		this.warTrophies = data.clanWarTrophies;
		this.location = new Location(client, data.location);
		this.requiredTrophies = data.requiredTrophies;
		this.donationsPerWeek = data.donationsPerWeek;
		this.members = new ClanMemberManager(client, this, data.memberList);
	}

	/**
	 * The clan's member count
	 */
	get memberCount(): number {
		return this.members.size;
	}

	/**
	 * Patches this clan.
	 * @param data - The data to update this clan with
	 * @returns The updated clan
	 */
	patch(data: Partial<APIClan>): this {
		super.patch(data);

		if (data.name !== undefined) this.name = data.name;
		if (data.type) this.type = ClanType[data.type];
		if (data.description !== undefined) this.description = data.description;
		if (data.badgeId !== undefined) this.badge = data.badgeId;
		if (data.clanScore !== undefined) this.score = data.clanScore;
		if (data.clanWarTrophies !== undefined)
			this.warTrophies = data.clanWarTrophies;
		if (data.location) this.location = new Location(this.client, data.location);
		if (data.requiredTrophies !== undefined)
			this.requiredTrophies = data.requiredTrophies;
		if (data.donationsPerWeek !== undefined)
			this.donationsPerWeek = data.donationsPerWeek;
		if (data.memberList)
			this.members = new ClanMemberManager(this.client, this, data.memberList);

		return this;
	}

	/**
	 * Gets a JSON representation of this clan.
	 * @returns The JSON representation of this clan
	 */
	toJson(): APIClan {
		return {
			...super.toJson(),
			badgeId: this.badge,
			clanScore: this.score,
			clanWarTrophies: this.warTrophies,
			description: this.description,
			donationsPerWeek: this.donationsPerWeek,
			location: this.location.toJson(),
			name: this.name,
			requiredTrophies: this.requiredTrophies,
			tag: this.tag,
			type: getEnumString(ClanType, this.type),
			memberList: this.members.map((member) => member.toJson()),
			clanChestLevel: 1,
			clanChestMaxLevel: 0,
			clanChestStatus: "inactive",
			members: this.memberCount,
		};
	}

	/**
	 * Gets a string representation of this clan.
	 * @returns The name of this clan
	 */
	toString(): string {
		return this.name;
	}

	/**
	 * Fetches this clan.
	 * @param options - The options for the fetch
	 * @returns A promise that resolves with the new clan
	 */
	fetch(options?: FetchOptions): Promise<this> {
		return this.client.clans.fetch(this.tag, options) as Promise<this>;
	}
}
