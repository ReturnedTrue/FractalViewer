import Roact from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { clientStore } from "client/rodux/store";
import { FractalView } from "./components/FractalView";
import { ParametersEditor } from "./components/ParametersEditor";
import { ParametersClipboard } from "./components/ParametersClipboard";
import { GuiService } from "@rbxts/services";
import { PivotDisplay } from "./components/PivotDisplay";
import { NotificationBar } from "./components/NotificationBar";
import { PopupMessage } from "./components/PopupMessage";
import { FractalDescription } from "./components/FractalDescription";

const [guiInset] = GuiService.GetGuiInset();

interface AppProps {}

export class App extends Roact.Component<AppProps> {
	render() {
		return (
			<RoactRodux.StoreProvider store={clientStore}>
				<screengui Key="Main" ZIndexBehavior={Enum.ZIndexBehavior.Sibling}>
					<frame
						Key="Background"
						BackgroundColor3={new Color3()}
						Position={UDim2.fromOffset(0, -guiInset.Y)}
						Size={new UDim2(1, 0, 1, guiInset.Y)}
						ZIndex={-1}
					/>

					<NotificationBar />
					<PopupMessage />

					<FractalView />
					<FractalDescription />

					<ParametersEditor />
					<ParametersClipboard />
					<PivotDisplay />
				</screengui>
			</RoactRodux.StoreProvider>
		);
	}
}
