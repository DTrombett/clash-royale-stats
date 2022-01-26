import type {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import type { APITag, ClientEvents, ClientRoyale } from "apiroyale";
import type { Snowflake } from "discord-api-types/v9";
import type {
	AutocompleteInteraction,
	Awaitable,
	ButtonInteraction,
	ChatInputCommandInteraction,
	ClientEvents as DiscordEvents,
	CommandInteraction,
	InteractionReplyOptions,
	MessageOptions,
	SelectMenuInteraction,
} from "discord.js";
import type { Command, Event } from ".";
import type LocalesIt from "../../locales/it.json";

/**
 * An action row to be sent to Discord
 */
export type ActionRowType = NonNullable<
	MessageOptions["components"]
> extends (infer T)[]
	? T
	: never;

/**
 * A function to interact with the API.
 * @param client - The client
 * @param id - The id to fetch
 * @param options - Additional options
 */
export type APIMethod<
	T,
	O extends Record<string, unknown> = Record<never, never>
> = (
	client: ClientRoyale,
	id: T,
	options: O & {
		lng?: string;
		ephemeral?: boolean;
	}
) => Promise<InteractionReplyOptions & MessageOptions>;

/**
 * Values used as custom identifiers for buttons
 */
export enum ButtonActions {
	/**
	 * Show the next page
	 */
	NextPage = "after",

	/**
	 * Show the previous page
	 */
	PreviousPage = "before",

	/**
	 * Show the river race log of a clan
	 */
	RiverRaceLog = "rl",

	/**
	 * Show clan's info
	 */
	ClanInfo = "ci",

	/**
	 * Show the current river race of a clan
	 */
	CurrentRiverRace = "cr",

	/**
	 * Show player's info
	 */
	PlayerInfo = "pi",

	/**
	 * Show a player achievement's info
	 */
	PlayerAchievements = "ai",

	/**
	 * Show a player's upcoming chests
	 */
	PlayerUpcomingChests = "uc",

	/**
	 * Show a clan's members
	 */
	ClanMembers = "cm",
}

/**
 * Types of other arguments for button actions
 */
export type ButtonActionsTypes = {
	[ButtonActions.NextPage]: [cursor: string];
	[ButtonActions.PreviousPage]: [cursor: string];
	[ButtonActions.RiverRaceLog]: [
		clan: APITag,
		index?: `${number}`,
		userId?: Snowflake
	];
	[ButtonActions.ClanInfo]: [clan: APITag];
	[ButtonActions.CurrentRiverRace]: [clan: APITag];
	[ButtonActions.PlayerInfo]: [player: APITag];
	[ButtonActions.PlayerAchievements]: [player: APITag];
	[ButtonActions.PlayerUpcomingChests]: [player: APITag];
	[ButtonActions.ClanMembers]: [
		clan: APITag,
		id?: Snowflake,
		index?: `${number}`,
		sort?: SortMethod
	];
};

/**
 * Options to create a command
 */
export type CommandOptions = {
	/**
	 * The data for this command
	 */
	data:
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder;

	/**
	 * If this event can only be executed from owners
	 */
	reserved?: boolean;

	/**
	 * A functions to run when an autocomplete request is received by Discord.
	 * @param this - The command object that called this
	 * @param interaction - The interaction received
	 */
	autocomplete?(
		this: Command,
		interaction: AutocompleteInteraction
	): Awaitable<void>;

	/**
	 * A function to run when this command is received by Discord.
	 * @param this - The command object that called this
	 * @param interaction - The interaction received
	 */
	run(this: Command, interaction: ChatInputCommandInteraction): Awaitable<void>;
};

/**
 * Custom emojis for the bot
 */

export enum CustomEmojis {
	/**
	 * The emoji of a war trophy
	 */
	WarTrophy = "<:wartrophy:906920944868671498>",

	/**
	 * The profile emoji of a user
	 */
	User = "<:user:915686990723285022>",

	/**
	 * The emoji of donations
	 */
	Donations = "<:donations:915687097984241685>",

	/**
	 * The emoji for clan members
	 */
	ClanMembers = "<:members:915688913413210123>",

	/**
	 * The emoji of the king level
	 */
	KingLevel = "<:kinglevel:916016946774958101>",

	/**
	 * The emoji for copying a deck
	 */
	CopyDeck = "<:copydeck:916029046700261417>",

	/**
	 * The emoji of a clan invite
	 */
	ClanInvite = "<:claninvite:916032272631750698>",

	/**
	 * The emoji for a win
	 */
	Win = "<:win:916339474403848223>",

	/**
	 * The emoji for a loss
	 */
	Lose = "<:lose:916339513591222322>",

	/**
	 * The emoji for cards
	 */
	Cards = "<:cards:916340767021203478>",

	/**
	 * The emoji for a medal
	 */
	Medal = "<:medal:918514839670886400>",

	/**
	 * The emoji for a war point
	 */
	WarPoint = "<:warpoint:918522796747915304>",

	/**
	 * The emoji for a boat attack
	 */
	BoatAttack = "<:boatattack:918909257745825793>",

	/**
	 * The emoji for a war deck
	 */
	WarDeck = "<:wardeck:918908890761035817>",

	/**
	 * The emoji for a war in a training state
	 */
	Training = "<:training:927624101219160207>",

	/**
	 * The emoji for a clan war
	 */
	ClanWar = "<:clanwar:933014402880393237>",

	/**
	 * The emoji for an achievement
	 */
	Achievement = "<:achievement:931157677130784778>",

	/**
	 * The emoji for a chest
	 */
	Chest = "<:chest:931886438541303839>",

	/**
	 * The emoji for received donations
	 */
	DonationsReceived = "<:donationsreceived:935866046815014952>",
}

/**
 * Emojis for the bot
 */

export enum Emojis {
	/**
	 * The emoji for a check mark
	 */
	Check = "✅",

	/**
	 * The emoji for a cross mark
	 */
	Cross = "❌",

	/**
	 * The emoji for a warning sign
	 */
	Warning = "⚠️",

	/**
	 * The emoji for a question mark
	 */
	Question = "❓",

	/**
	 * The emoji for a exclamation mark
	 */
	Exclamation = "❗",

	/**
	 * The emoji for a double exclamation mark
	 */
	DoubleExclamation = "❕",

	/**
	 * The emoji for a heavy check mark
	 */
	HeavyCheck = "✔️",

	/**
	 * The emoji for a heavy multiplication sign
	 */
	HeavyMultiplication = "✖️",

	/**
	 * The emoji for a heavy division sign
	 */
	HeavyDivision = "➗",

	/**
	 * The emoji for a heavy minus sign
	 */
	HeavyMinus = "➖",

	/**
	 * The emoji for a heavy plus sign
	 */
	HeavyPlus = "➕",

	/**
	 * The emoji for a trophy
	 */
	Trophy = "🏆",

	/**
	 * The emoji for a crown
	 */
	Crown = "👑",

	/**
	 * The emoji for a star
	 */
	Star = "⭐",

	/**
	 * The emoji for a sparkles
	 */
	Sparkles = "✨",

	/**
	 * The emoji for a snowflake
	 */
	Snowflake = "❄",

	/**
	 * The emoji for a heart
	 */
	Heart = "❤",

	/**
	 * The emoji for a heavy heart
	 */
	HeavyHeart = "💖",

	/**
	 * The emoji for money with wings
	 */
	MoneyWithWings = "💸",

	/**
	 * The emoji for people
	 */
	People = "👥",

	/**
	 * The emoji for a score
	 */
	Score = "💯",

	/**
	 * The emoji for a location
	 */
	Location = "📍",

	/**
	 * The emoji for a back arrow
	 */
	BackArrow = "⬅",

	/**
	 * The emoji for a forward arrow
	 */
	ForwardArrow = "➡",

	/**
	 * The emoji for an up arrow
	 */
	UpArrow = "⬆",

	/**
	 * The emoji for a down arrow
	 */
	DownArrow = "⬇",

	/**
	 * The emoji for a medal
	 */
	medal = "🏅",

	/**
	 * The emoji for a boat
	 */
	Boat = "⛵",

	/**
	 * The emoji for a dagger
	 */
	Dagger = "🗡",

	/**
	 * The emoji for a deck
	 */
	Deck = "🎴",

	/**
	 * The emoji for an information symbol
	 */
	Info = "ℹ",

	/**
	 * The emoji for a log
	 */
	Log = "🗒",

	/**
	 * The emoji for crossed swords
	 */
	CrossedSwords = "⚔",

	/**
	 * The emoji for a robot
	 */
	Robot = "🤖",

	/**
	 * The emoji for today
	 */
	Today = "📅",

	/**
	 * The emoji for a watch
	 */
	Watch = "⌚",

	/**
	 * The emoji for the alphabet
	 */
	Alphabet = "🔤",
}

/**
 * The data for an event
 */
export type EventOptions<
	T extends EventType = EventType,
	K extends T extends EventType.APIRoyale
		? keyof ClientEvents
		: T extends EventType.Discord
		? keyof DiscordEvents
		: never = T extends EventType.APIRoyale
		? keyof ClientEvents
		: T extends EventType.Discord
		? keyof DiscordEvents
		: never
> = {
	/**
	 * The name of the event
	 */
	name: K;

	/**
	 * The type of the event
	 */
	type: T;

	/**
	 * The function to execute when the event is received
	 */
	on?: (
		this: Event<T, K>,
		...args: K extends keyof ClientEvents
			? ClientEvents[K]
			: K extends keyof DiscordEvents
			? DiscordEvents[K]
			: never
	) => Awaitable<void>;

	/**
	 * The function to execute when the event is received once
	 */
	once?: EventOptions<T, K>["on"];
};

/**
 * The type for an event
 */
export enum EventType {
	Discord = "discord",
	APIRoyale = "royale",
}

/**
 * All the face emojis
 */
export enum FaceEmojis {
	":)" = "😊",
	":D" = "😀",
	":P" = "😛",
	":O" = "😮",
	":*" = "😗",
	";)" = "😉",
	":|" = "😐",
	":/" = "😕",
	":S" = "😖",
	":$" = "😳",
	":@" = "😡",
	":^)" = "😛",
	":\\" = "😕",
}

/**
 * A list of locale codes
 */
export enum LocaleCodes {
	IT = "it",
	GB = "en-US",
	ES = "es-ES",
	DE = "de",
	FR = "fr",
	NL = "nl",
	NO = "no",
	FI = "fi",
	RU = "ru",
	TR = "tr",
	VI = "vi",
	TH = "th",
	TW = "zh-TW",
}

/**
 * The match level from comparing 2 strings
 */
export enum MatchLevel {
	/**
	 * The strings don't match at all
	 */
	None,

	/**
	 * The second string is a substring of the first one
	 */
	Partial,

	/**
	 * The second string is at the end of the first one
	 */
	End,

	/**
	 * The second string is at the beginning of the first one
	 */
	Start,

	/**
	 * The second string is the same as the first one
	 */
	Full,
}

/**
 * Values used as custom identifiers for select menus
 */
export enum MenuActions {
	/**
	 * Show info about a player
	 */
	PlayerInfo = "player",

	/**
	 * Show info about a clan
	 */
	ClanInfo = "clan",

	/**
	 * Show info about a clan's members
	 */
	ClanMembers = "members",
}

/**
 * Types of other arguments for button actions
 */
export type MenuActionsTypes = {
	[MenuActions.PlayerInfo]: [];
	[MenuActions.ClanInfo]: [];
	[MenuActions.ClanMembers]: [tag: APITag, id?: Snowflake];
};

/**
 * An interaction that can be replied to
 */
export type ReplyableInteraction =
	| ButtonInteraction
	| CommandInteraction
	| SelectMenuInteraction;

/**
 * How members should be sorted in a clan
 */
export enum SortMethod {
	Rank = "r",
	DonationsPerWeek = "dpw",
	LastSeenDesc = "lsd",
	Name = "n",
	LastSeen = "ls",
	DonationsReceivedPerWeek = "drpw",
}

/**
 * A string identifier for a translation value
 */
export type TranslationKeys<
	T = TranslationSample,
	K extends keyof T = keyof T
> = K extends string
	? `${K extends `${infer U}_${string}` ? U : K}${
			| ""
			| (T[K] extends string
					? never
					: `.${TranslationKeys<T[K], keyof T[K]>}`)}`
	: never;

/**
 * A translation value
 */
export type TranslationResult<
	K extends string,
	T = TranslationSample,
	G extends string = K extends `${infer U}.${string}` ? U : K,
	F extends Exclude<keyof T, symbol> = Exclude<
		Extract<keyof T, G extends keyof T ? G : `${G}_${string}`>,
		symbol
	>
> = F extends never
	? never
	: T[F] extends string
	? T[F]
	: K extends `${F}.${infer U}`
	? TranslationResult<U, T[F]>
	: T[F];

/**
 * A sample of a translation
 */
export type TranslationSample = typeof LocalesIt;

/**
 * A list of all the variables
 */
export type Variables = {
	players: Record<Snowflake, APITag | undefined>;
};
