import Roact from "@rbxts/roact";
import { InterfaceMode } from "client/enums/InterfaceMode";
import { TweenableNumberBinding } from "client/roact/util/classes/TweenableNumberBinding";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { onFullPictureChange } from "client/roact/util/functions/onFullPictureChange";
import { clientStore } from "client/rodux/store";
import { DescriptionBox } from "./DescriptionBox";
import { FractalId } from "shared/enums/FractalId";

interface FractalDescriptionProps {
	interfaceMode: InterfaceMode;
	fractalViewed: FractalId;
}

export class BaseFractalDescription extends Roact.Component<FractalDescriptionProps> {
	private openButtonPosition = new TweenableNumberBinding(0.9, { time: 0.5 });

	render() {
		if (this.props.interfaceMode === InterfaceMode.Hidden) return;

		return (
			<frame
				Key="OpenButton"
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Position={this.openButtonPosition.binding.map((value) => new UDim2(value, 0, 0.89, 0))}
				Size={new UDim2(0.05, 0, 0.065, 0)}
			>
				<CornerAndPadding />

				<textbutton
					Event={{
						MouseButton1Click: () => {
							clientStore.dispatch({
								type: "sendPopup",
								element: <DescriptionBox fractalViewed={this.props.fractalViewed} />,
							});
						},
					}}
					BackgroundColor3={Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(1, 0, 1, 0)}
					Text="?"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textbutton>
			</frame>
		);
	}

	protected didUpdate(previousProps: FractalDescriptionProps) {
		onFullPictureChange(
			this.props.interfaceMode,
			previousProps.interfaceMode,
			() => this.openButtonPosition.tween(1.9),
			() => this.openButtonPosition.tween(0.9),
		);
	}
}

export const FractalDescription = connectComponent(BaseFractalDescription, (state) => {
	return {
		interfaceMode: state.fractal.interfaceMode,
		fractalViewed: state.fractal.parameters.fractalId,
	};
});
