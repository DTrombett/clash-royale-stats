import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { Clan, ClanMemberRole, ClanType } from "apiroyale";
import {
	Constants as DiscordCostants,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { t } from "i18next";
import capitalize from "../capitalize";
import Constants from "../Constants";
import CustomClient from "../CustomClient";
import { buildCustomButtonId, buildCustomMenuId } from "../customId";
import normalizeTag from "../normalizeTag";
import { ButtonActions, CustomEmojis, Emojis, MenuActions } from "../types";
import validateTag from "../validateTag";

/**
 * Displays information about a clan.
 * @param client - The client
 * @param tag - The tag of the clan
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const clanInfo = async (
	client: ClientRoyale,
	tag: string,
	{ ephemeral, lng }: { lng?: string; ephemeral?: boolean }
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: t("commond.invalidTag", { lng }),
			ephemeral: true,
		};

	const clan = await client.clans.fetch(tag).catch((error: Error) => {
		CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(clan instanceof Clan)) return clan;
	const embed = new Embed()
		.setTitle(t("commands.clan.info.title", { lng, clan }))
		.setDescription(clan.description)
		.setColor(DiscordCostants.Colors.BLUE)
		.setFooter({ text: t("common.lastUpdated", { lng }) })
		.setTimestamp(clan.lastUpdate)
		.setThumbnail(clan.badgeUrl)
		.setURL(Constants.clanLink(clan));

	embed
		.addField({
			...t("commands.clan.info.fields.warTrophies", {
				lng,
				returnObjects: true,
				warTrophies: clan.warTrophies,
			}),
		})
		.addField({
			...t("commands.clan.info.fields.location", {
				lng,
				returnObjects: true,
				location: clan.locationName,
			}),
			inline: true,
		})
		.addField({
			...t("commands.clan.info.fields.requiredTrophies", {
				lng,
				returnObjects: true,
				requiredTrophies: clan.requiredTrophies,
			}),
			inline: true,
		})
		.addField({
			...t("commands.clan.info.fields.weeklyDonations", {
				lng,
				returnObjects: true,
				weeklyDonations: clan.donationsPerWeek,
			}),
			inline: true,
		})
		.addField({
			...t("commands.clan.info.fields.score", {
				lng,
				returnObjects: true,
				score: clan.score,
			}),
			inline: true,
		})
		.addField({
			...t("commands.clan.info.fields.type", {
				lng,
				returnObjects: true,
				type: capitalize(ClanType[clan.type]),
			}),
			inline: true,
		})
		.addField({
			...t("commands.clan.info.fields.memberCount", {
				lng,
				returnObjects: true,
				memberCount: clan.members.size,
			}),
		});

	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.addOptions(
				clan.members.first(25).map((member) => ({
					...t("commands.clan.info.menu.options", {
						lng,
						returnObjects: true,
						member,
						role: capitalize(ClanMemberRole[member.role]),
					}),
					emoji: CustomEmojis.user,
					value: member.tag,
				}))
			)
			.setPlaceholder(t("commands.clan.info.menu.placeholder", { lng }))
			.setCustomId(buildCustomMenuId(MenuActions.PlayerInfo))
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.RiverRaceLog, tag))
			.setEmoji(Emojis.Log)
			.setLabel(t("commands.clan.info.buttons.riverRaceLog.label", { lng }))
			.setStyle(MessageButtonStyles.PRIMARY)
	);

	return {
		embeds: [embed],
		components: [row1, row2],
		ephemeral,
	};
};