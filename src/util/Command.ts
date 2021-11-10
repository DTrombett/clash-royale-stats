import type { CommandInteraction } from "discord.js";
import type { CommandOptions } from "../types";
import type CustomClient from "../CustomClient";

/**
 * A class representing a Discord slash command
 */
export class Command {
	/**
	 * The client that instantiated this
	 */
	client: CustomClient;

	/**
	 * The Discord data for this command
	 */
	data: CommandOptions["data"];

	/**
	 * The function provided to handle the command received
	 */
	private _execute: OmitThisParameter<CommandOptions["run"]>;

	/**
	 * @param options - Options for this command
	 */
	constructor(client: CustomClient, options: CommandOptions) {
		this._execute = options.run.bind(this);
		this.client = client;
		this.data = options.data;
	}

	/**
	 * The name of this command
	 */
	get name() {
		return this.data.name;
	}
	set name(name) {
		this.data.setName(name);
	}

	/**
	 * Run this command.
	 * @param interaction - The interaction received
	 */
	async run(interaction: CommandInteraction) {
		try {
			await this._execute(interaction);
		} catch (message) {
			console.error(message);
		}
	}
}

export default Command;
