import { bold, Embed, time } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { ClanMemberList } from "apiroyale";
import { Constants as DiscordConstants, MessageActionRow } from "discord.js";
import capitalize from "../capitalize";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions, CustomEmojis, Emojis } from "../types";
import validateTag from "../validateTag";

/**
 * Displays information about a clan's members.
 * @param client - The client
 * @param tag - The tag of the clan
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const clanMembers = async (
	client: ClientRoyale,
	tag: string,
	{ ephemeral, lng }: { lng?: string; ephemeral?: boolean }
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: translate("common.invalidTag", { lng }),
			ephemeral: true,
		};

	const members = await client
		.fetchClanMembers({ tag })
		.catch((error: Error) => {
			void CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if (!(members instanceof ClanMemberList)) return members;
	const embed = new Embed()
		.setAuthor({
			name: translate("commands.player.achievements.author", {
				lng,
				player: members,
			}),
			url: Constants.playerLink(tag),
		})
		.setTitle(
			translate("commands.clan.members.title", { lng, size: members.size })
		)
		.setColor(DiscordConstants.Colors.BLURPLE)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(members.first()?.lastUpdate)
		.setURL(Constants.clanLink(tag))
		.setDescription(
			members
				.map(
					(member) =>
						`#${member.rank} ${bold(member.name)} (${member.tag}): ${capitalize(
							member.role
						)} - ${CustomEmojis.donations} ${member.donationsPerWeek} - ${
							Emojis.Trophy
						} ${member.trophies} - ${time(member.lastSeen, "R")}`
				)
				.join("\n")
		);

	const row1 = new MessageActionRow().addComponents(
		createActionButton(
			ButtonActions.ClanInfo,
			{
				label: translate("commands.clan.buttons.clanInfo.label", { lng }),
			},
			tag
		),
		createActionButton(
			ButtonActions.CurrentRiverRace,
			{
				label: translate("commands.clan.buttons.currentRiverRace.label", {
					lng,
				}),
			},
			tag
		),
		createActionButton(
			ButtonActions.RiverRaceLog,
			{
				label: translate("commands.clan.buttons.riverRaceLog.label", { lng }),
			},
			tag
		)
	);

	return {
		embeds: [embed],
		components: [row1],
		ephemeral,
	};
};