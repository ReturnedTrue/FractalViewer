import Roact from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { clientStore } from "client/rodux/store";
import { FractalView } from "./components/FractalView";

interface AppProps {}

export class App extends Roact.Component<AppProps> {
	render() {
		return (
			<RoactRodux.StoreProvider store={clientStore}>
				<screengui Key="Main">
					<FractalView />
				</screengui>
			</RoactRodux.StoreProvider>
		);
	}
}
