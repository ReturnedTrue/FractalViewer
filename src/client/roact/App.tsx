import Roact from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { clientStore } from "client/rodux/store";
import { FractalView } from "./components/FractalView";
import { ParametersEditor } from "./components/ParametersEditor";

interface AppProps {}

export class App extends Roact.Component<AppProps> {
	render() {
		return (
			<RoactRodux.StoreProvider store={clientStore}>
				<screengui Key="Main">
					<frame
						Key="Background"
						BackgroundColor3={new Color3()}
						Position={UDim2.fromOffset(0, -37)}
						Size={new UDim2(1, 0, 1, 37)}
						ZIndex={-1}
					/>

					<FractalView />
					<ParametersEditor />
				</screengui>
			</RoactRodux.StoreProvider>
		);
	}
}
