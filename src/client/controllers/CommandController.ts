import { Controller, OnStart } from "@flamework/core";
import { TextChatService } from "@rbxts/services";
import { Functions } from "client/remotes";
import { clientStore } from "client/rodux/store";
import { COMMAND_PREFIX } from "client/constants/command";
import { DEFAULT_FRACTAL_PARAMETERS } from "shared/constants/fractal";

interface CommandData {
	name: string;
	triggered: (message: string) => void;
}

const commands: Array<CommandData> = [
	{
		name: "save",
		triggered: () => {
			const parameters = clientStore.getState().fractal.parameters;

			const [remoteSuccess, savingSuccess] = Functions.saveParameters.invoke(parameters).await();
			const fullSuccess = remoteSuccess && savingSuccess;

			clientStore.dispatch({
				type: "sendNotification",
				data: {
					text: fullSuccess ? "saved parameters successfully" : "failed to save parameters, please try again",
				},
			});
		},
	},

	{
		name: "loadsave",
		triggered: () => {
			const { savedParameters } = clientStore.getState().persistentData;

			clientStore.dispatch({
				type: "setParameters",
				parameters: savedParameters,
			});

			clientStore.dispatch({
				type: "sendNotification",
				data: {
					text: "loaded saved parameters",
				},
			});
		},
	},

	{
		name: "removesave",
		triggered: () => {
			const [remoteSuccess, savingSuccess] = Functions.saveParameters.invoke(DEFAULT_FRACTAL_PARAMETERS).await();
			const fullSuccess = remoteSuccess && savingSuccess;

			clientStore.dispatch({
				type: "sendNotification",
				data: {
					text: fullSuccess
						? "removed saved parameters successfully"
						: "failed to remove saved parameters, please try again",
				},
			});
		},
	},
];

@Controller()
export class CommandController implements OnStart {
	onStart() {
		for (const commandData of commands) {
			this.createCommand(commandData);
		}
	}

	private createCommand(commandData: CommandData) {
		const commandInstance = new Instance("TextChatCommand");
		commandInstance.Name = "Command_" + commandData.name;
		commandInstance.PrimaryAlias = COMMAND_PREFIX + commandData.name;
		commandInstance.AutocompleteVisible = true;
		commandInstance.Triggered.Connect((_, message) => commandData.triggered(message));
		commandInstance.Parent = TextChatService;
	}
}
