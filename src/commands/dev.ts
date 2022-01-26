import {
	bold,
	codeBlock,
	Embed,
	inlineCode,
	SlashCommandBuilder,
	time,
	TimestampStyles,
} from "@discordjs/builders";
import { Constants, Util } from "discord.js";
import type { Buffer } from "node:buffer";
import type { ChildProcess } from "node:child_process";
import { exec, execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import {
	argv,
	cwd,
	env,
	exit,
	memoryUsage,
	stderr,
	stdin,
	stdout,
	uptime,
} from "node:process";
import prettier from "prettier";
import type { CommandOptions } from "../util";
import { CustomClient, parseEval, restart } from "../util";

enum SubCommands {
	shell = "shell",
	evalCmd = "eval",
	test = "test",
	ram = "ram",
	restartCmd = "restart",
	shutdown = "shutdown",
	uptimeCmd = "uptime",
	pull = "pull",
	cpp = "cpp",
}
enum SubCommandOptions {
	cmd = "cmd",
	ephemeral = "ephemeral",
	process = "process",
	rebuild = "rebuild",
	registerCommands = "synccommands",
	restartProcess = "restart",
	packages = "packages",
	code = "code",
	include = "include",
	namespaces = "namespaces",
}

const bytesToMb = (memory: number) =>
		Math.round((memory / 1024 / 1024) * 100) / 100,
	commaRegex = /,\s{0,}/g;

export const command: CommandOptions = {
	reserved: true,
	data: new SlashCommandBuilder()
		.setName("dev")
		.setDescription("Comandi privati disponibili solo ai sviluppatori")
		.setDefaultPermission(false)
		.addSubcommand((shell) =>
			shell
				.setName(SubCommands.shell)
				.setDescription("Esegue un comando nel terminal")
				.addStringOption((cmd) =>
					cmd
						.setName(SubCommandOptions.cmd)
						.setDescription("Comando da eseguire")
						.setRequired(true)
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((evalCmd) =>
			evalCmd
				.setName(SubCommands.evalCmd)
				.setDescription("Esegue del codice")
				.addStringOption((cmd) =>
					cmd
						.setName(SubCommandOptions.cmd)
						.setDescription("Codice da eseguire")
						.setRequired(true)
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((ram) =>
			ram
				.setName(SubCommands.ram)
				.setDescription("Mostra la RAM utilizzata")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((restartCmd) =>
			restartCmd
				.setName(SubCommands.restartCmd)
				.setDescription("Riavvia il bot")
				.addBooleanOption((process) =>
					process
						.setName(SubCommandOptions.process)
						.setDescription("Se riavviare il processo (default: true)")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((shutdown) =>
			shutdown
				.setName(SubCommands.shutdown)
				.setDescription("Spegni il bot")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((uptimeCmd) =>
			uptimeCmd
				.setName(SubCommands.uptimeCmd)
				.setDescription("Mostra l'uptime del bot")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((pull) =>
			pull
				.setName(SubCommands.pull)
				.setDescription("Aggiorna il bot")
				.addBooleanOption((rebuild) =>
					rebuild
						.setName(SubCommandOptions.rebuild)
						.setDescription("Ricompila il progetto con i nuovi cambiamenti")
				)
				.addBooleanOption((registerCommands) =>
					registerCommands
						.setName(SubCommandOptions.registerCommands)
						.setDescription("Sincronizza i comandi con Discord")
				)
				.addBooleanOption((restartProcess) =>
					restartProcess
						.setName(SubCommandOptions.restartProcess)
						.setDescription("Riavvia il processo")
				)
				.addBooleanOption((packages) =>
					packages
						.setName(SubCommandOptions.packages)
						.setDescription("Aggiorna i pacchetti")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((cpp) =>
			cpp
				.setName(SubCommands.cpp)
				.setDescription("Compila il codice")
				.addStringOption((code) =>
					code
						.setName(SubCommandOptions.code)
						.setDescription("Codice da compilare")
						.setRequired(true)
				)
				.addStringOption((include) =>
					include
						.setName(SubCommandOptions.include)
						.setDescription(
							"Librerie da includere, separate da virgola (default: iostream)"
						)
				)
				.addStringOption((namespaces) =>
					namespaces
						.setName(SubCommandOptions.namespaces)
						.setDescription("Namespaces da usare (default: std)")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((test) =>
			test.setName(SubCommands.test).setDescription("Un comando di test")
		),
	async run(interaction) {
		await interaction.deferReply({
			ephemeral:
				interaction.options.getBoolean(SubCommandOptions.ephemeral) ?? true,
		});
		const now = Date.now();
		let botUptime: Date,
			child: ChildProcess,
			cmd: string,
			code: string,
			commands: string[],
			error: Error | undefined,
			exitCode: number,
			memory: NodeJS.MemoryUsage,
			output: string,
			processUptime: Date,
			restartProcess: boolean,
			result: string;

		switch (interaction.options.getSubcommand()) {
			case SubCommands.shell:
				cmd = interaction.options.getString(SubCommandOptions.cmd, true);
				child = exec(cmd);
				output = "";
				child.stdout?.on("data", (data: Buffer) => (output += data.toString()));
				child.stderr?.on("data", (data: Buffer) => (output += data.toString()));
				child.stderr?.pipe(stderr);
				child.stdout?.pipe(stdout);
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				await interaction.editReply({
					content: `Comando eseguito in ${Date.now() - now}ms\n${inlineCode(
						`${cwd()}> ${Util.escapeInlineCode(cmd.slice(0, 2000 - 100))}`
					)}`,
					embeds: [
						new Embed()
							.setAuthor({
								name: interaction.user.tag,
								iconURL: interaction.user.displayAvatarURL(),
							})
							.setTitle("Output")
							.setDescription(
								codeBlock(Util.escapeCodeBlock(output.slice(0, 4096 - 7)))
							)
							.setColor(
								exitCode === 0 ? Constants.Colors.GREEN : Constants.Colors.RED
							)
							.setTimestamp(),
					],
				});
				break;
			case SubCommands.evalCmd:
				code = interaction.options.getString(SubCommandOptions.cmd, true);
				try {
					code = prettier
						.format(code, {
							...((await prettier
								.resolveConfig(".prettierrc.json")
								.catch(() => null)) ?? {}),
						})
						.slice(0, -1);
					result = await parseEval(code);
				} catch (e) {
					result = CustomClient.inspect(e);
				}
				void CustomClient.printToStdout(result);
				await interaction.editReply({
					content: `Eval elaborato in ${Date.now() - now}ms`,
					embeds: [
						new Embed()
							.setAuthor({
								name: interaction.user.tag,
								iconURL: interaction.user.displayAvatarURL(),
							})
							.setTitle("Eval output")
							.setDescription(
								codeBlock("js", Util.escapeCodeBlock(result).slice(0, 4096 - 9))
							)
							.addField({
								name: "Input",
								value: codeBlock(
									"js",
									Util.escapeCodeBlock(code).slice(0, 1024 - 9)
								),
							})
							.setColor(Constants.Colors.BLURPLE)
							.setTimestamp(),
					],
				});
				break;
			case SubCommands.ram:
				memory = memoryUsage();
				await interaction.editReply({
					content: `Memoria calcolata in ${Date.now() - now}ms`,
					embeds: [
						new Embed()
							.setAuthor({
								name: interaction.user.tag,
								iconURL: interaction.user.displayAvatarURL(),
							})
							.setTitle("RAM")
							.setDescription(
								`${bold("Resident Set Size")}: ${bytesToMb(
									memory.rss
								)} MB\n${bold("Heap Total")}: ${bytesToMb(
									memory.heapTotal
								)} MB\n${bold("Heap Used")}: ${bytesToMb(
									memory.heapUsed
								)} MB\n${bold("External")}: ${bytesToMb(memory.external)} MB`
							)
							.setColor(
								Math.round(((memory.rss / 1024 / 1024) * 16777215) / 500)
							)
							.setTimestamp(),
					],
				});
				break;
			case SubCommands.restartCmd:
				if (interaction.options.getBoolean(SubCommandOptions.process) ?? true) {
					await interaction.editReply({
						content: `Sto facendo ripartire il programma con i seguenti argv:\n${argv
							.map((arg) => inlineCode(Util.escapeInlineCode(arg)))
							.join("\n")}`,
					});
					restart(this.client);
				} else {
					this.client.bot.destroy();
					this.client.token = env.DISCORD_TOKEN!;
					await this.client.bot.login();
					await interaction.editReply({
						content: `Ricollegato in ${Date.now() - now}ms.`,
					});
				}
				break;
			case SubCommands.shutdown:
				await interaction.editReply({
					content: `Sto spegnendo il bot...`,
				});
				this.client.bot.destroy();
				return exit(0);
			case SubCommands.uptimeCmd:
				processUptime = new Date(Date.now() - uptime() * 1000);
				botUptime = new Date(Date.now() - this.client.bot.uptime!);
				await interaction.editReply({
					content: `Process uptime calcolato in ${bold(
						`${Date.now() - now}ms`
					)}`,
					embeds: [
						new Embed()
							.setAuthor({
								name: interaction.user.tag,
								iconURL: interaction.user.displayAvatarURL(),
							})
							.setTitle("Uptime")
							.setDescription(
								`${bold("Processo")}: ${time(
									processUptime,
									TimestampStyles.RelativeTime
								)} (${time(processUptime)})\n${bold("Bot")}: ${time(
									botUptime,
									TimestampStyles.RelativeTime
								)} (${time(botUptime)})`
							)
							.setColor(Constants.Colors.BLURPLE)
							.setTimestamp(),
					],
				});
				break;
			case SubCommands.pull:
				output = "";
				commands = ["git pull"];
				restartProcess =
					interaction.options.getBoolean(SubCommandOptions.restartProcess) ??
					false;
				if (interaction.options.getBoolean(SubCommandOptions.packages) ?? false)
					commands.push("rm -r node_modules", "rm package-lock.json", "npm i");
				if (interaction.options.getBoolean(SubCommandOptions.rebuild) ?? false)
					commands.push("npm run build");
				if (
					interaction.options.getBoolean(SubCommandOptions.registerCommands) ??
					false
				)
					commands.push("npm run commands");
				child = exec(commands.join(" && "));
				child.stdout?.on("data", (data) => (output += data));
				child.stderr?.on("data", (data) => (output += data));
				child.stdout?.pipe(stdout);
				child.stderr?.pipe(stderr);
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				await interaction.editReply({
					content:
						exitCode === 0
							? `Ho eseguito ${commands.join(" && ")} in ${
									Date.now() - now
							  }ms\n${
									restartProcess
										? "Sto riavviando il processo per rendere effettivi i cambiamenti..."
										: "Il bot è nuovamente pronto all'uso!"
							  }`
							: `Errore durante l'esecuzione di ${inlineCode(
									commands.join(" && ")
							  )}\nCodice di errore: ${exitCode}`,
					embeds: [
						new Embed()
							.setAuthor({
								name: interaction.user.tag,
								iconURL: interaction.user.displayAvatarURL(),
							})
							.setTitle("Output")
							.setDescription(
								codeBlock(Util.escapeCodeBlock(output.slice(0, 4096 - 7)))
							)
							.setColor(
								exitCode ? Constants.Colors.GREEN : Constants.Colors.RED
							)
							.setTimestamp(),
					],
				});
				if (restartProcess && exitCode === 0) restart(this.client);
				break;
			case SubCommands.cpp:
				code = `${(
					interaction.options.getString(SubCommandOptions.include) ?? "iostream"
				)
					.split(commaRegex)
					.map((include) => `#include <${include}>`)
					.join("\n")}\n${(
					interaction.options.getString(SubCommandOptions.namespaces) ?? "std"
				)
					.split(commaRegex)
					.map((namespace) => `using namespace ${namespace};`)
					.join("\n")}\n\nint main() {\n\t${interaction.options.getString(
					SubCommandOptions.code,
					true
				)}\n}`;
				error = await new Promise((resolve) => {
					createWriteStream("./tmp/cpp.cpp")
						.once("error", resolve)
						.once("finish", resolve)
						.setDefaultEncoding("utf8")
						.end(code);
				});
				if (error) {
					void CustomClient.printToStderr(error);
					await interaction.editReply({
						content: `Errore durante la creazione del file: ${CustomClient.inspect(
							error
						)}`,
					});
					break;
				}
				child = exec("g++ ./tmp/cpp.cpp -o ./tmp/cpp.exe");
				output = "";
				child.stdout?.on("data", (data) => (output += data));
				child.stderr?.on("data", (data) => (output += data));
				child.stdout?.pipe(stdout);
				child.stderr?.pipe(stderr);
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				unlink("./tmp/cpp.cpp").catch(CustomClient.printToStderr);
				if (exitCode) {
					await interaction.editReply({
						content: `Errore durante la compilazione del codice C++\nCodice di errore: ${exitCode}`,
						embeds: [
							new Embed()
								.setAuthor({
									name: interaction.user.tag,
									iconURL: interaction.user.displayAvatarURL(),
								})
								.setTitle("Output")
								.setDescription(
									codeBlock(Util.escapeCodeBlock(output.slice(0, 4096 - 7)))
								)
								.setColor(Constants.Colors.RED)
								.setTimestamp(),
							new Embed()
								.setAuthor({
									name: interaction.user.tag,
									iconURL: interaction.user.displayAvatarURL(),
								})
								.setTitle("Codice C++")
								.setDescription(
									codeBlock(
										"cpp",
										Util.escapeCodeBlock(code.slice(0, 4096 - 7))
									)
								)
								.setColor(Constants.Colors.BLURPLE)
								.setTimestamp(),
						],
					});
					break;
				}
				const collector = interaction.channel?.createMessageCollector({
					filter: (m) => m.author.id === interaction.user.id,
				});
				const onData = (data: Buffer) => {
					output += data;
					interaction
						.editReply({
							content: output,
						})
						.catch(CustomClient.printToStderr);
				};

				output = "";
				child = execFile("./tmp/cpp.exe");
				child.stderr?.on("data", onData);
				child.stdout?.on("data", onData);
				stdin.pipe(child.stdin!);
				collector?.on("collect", (message) => {
					const input = `${message.content}\n`;

					if (message.deletable)
						message.delete().catch(CustomClient.printToStderr);
					output += input;
					child.stdin?.write(input);
				});
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				collector?.stop();
				unlink("./tmp/cpp.exe").catch(CustomClient.printToStderr);
				await interaction.editReply({
					content: `${output}\n\nProcesso terminato in ${
						Date.now() - now
					}ms con codice ${exitCode}`,
				});
				break;
			default:
				await interaction.editReply("Comando non riconosciuto");
		}

		return undefined;
	},
};
