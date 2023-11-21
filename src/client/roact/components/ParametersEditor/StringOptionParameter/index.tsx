import Roact, { createRef } from "@rbxts/roact";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { clientStore } from "client/rodux/store";
import { FractalParameterValueForType } from "shared/types/FractalParameters";
import { CoreParameterProps } from "..";
import { OptionFrame } from "./OptionFrame";
import { PixelScrollingFrame } from "client/roact/util/components/PixelScrollingFrame";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { AppearFrame } from "./AppearFrame";

interface StringOptionParameterProps extends CoreParameterProps<string> {
	options: Array<FractalParameterValueForType<string>>;
	appearOnRight: boolean;
}

interface StringOptionParameterState {
	optionSize?: UDim2;

	isOpen: boolean;
}

export class StringOptionParameter extends Roact.Component<StringOptionParameterProps, StringOptionParameterState> {
	state = identity<StringOptionParameterState>({
		isOpen: false,
	});

	private currentOptionRef = createRef<TextButton>();

	render() {
		return (
			<frame
				Key={this.props.playerFacingName}
				LayoutOrder={this.props.order}
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Size={new UDim2(0.2, 0, 0.05, 0)}
			>
				<CornerAndPadding
					paddingOverride={{
						PaddingLeft: new UDim(0.05, 0),
						PaddingRight: new UDim(0.025, 0),
					}}
				/>

				<textlabel
					Key="ParameterName"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(0.425, 0, 1, 0)}
					Text={this.props.playerFacingName}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<OptionFrame
					ref={this.currentOptionRef}
					position={new UDim2(0.5, 0, 0, 0)}
					size={new UDim2(0.5, 0, 1, 0)}
					optionValue={this.props.currentValue}
					onSelected={() => this.setState({ isOpen: !this.state.isOpen })}
				/>

				{this.state.isOpen && this.state.optionSize !== undefined && (
					<AppearFrame
						optionSize={this.state.optionSize}
						currentValue={this.props.currentValue}
						onNewValue={this.props.onNewValue}
						options={this.props.options}
						appearOnRight={this.props.appearOnRight}
					/>
				)}
			</frame>
		);
	}

	protected didMount(): void {
		// Utilises the first option frame to generate a size for all
		const currentOption = this.currentOptionRef.getValue()!;

		const setSize = () => {
			const absSize = currentOption.AbsoluteSize;

			this.setState({ optionSize: UDim2.fromOffset(absSize.X, absSize.Y) });
		};

		setSize();
		currentOption.GetPropertyChangedSignal("AbsoluteSize").Connect(setSize);
	}

	protected didUpdate(previousProps: StringOptionParameterProps, previousState: StringOptionParameterState): void {
		// Close when new option selected
		if (previousProps.currentValue !== this.props.currentValue && this.state.isOpen) {
			this.setState({ isOpen: false });
		}
	}
}
