import { Controller, OnStart } from "@flamework/core";
import { TextChatService } from "@rbxts/services";
import { Functions } from "client/remotes";
import { clientStore } from "client/rodux/store";
import { COMMAND_PREFIX } from "client/constants/command";

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
				data: fullSuccess
					? {
							text: "saved parameters successfully",
					  }
					: {
							text: "failed to save parameters, please try again",
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
