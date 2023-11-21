import Roact from "@rbxts/roact";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { FractalParameterValueForType } from "shared/types/FractalParameters";

interface OptionFrameProps {
	ref?: Roact.Ref<TextButton>;
	position?: UDim2;
	size?: UDim2;

	optionValue: FractalParameterValueForType<string>;
	onSelected: (value: this["optionValue"]) => void;
}

export class OptionFrame extends Roact.Component<OptionFrameProps> {
	render() {
		return (
			<textbutton
				Key="OptionFrame"
				Ref={this.props.ref}
				Event={{
					MouseButton1Click: () => this.props.onSelected(this.props.optionValue),
				}}
				BackgroundColor3={Color3.fromRGB(52, 52, 52)}
				BorderSizePixel={0}
				Position={this.props.position}
				Size={this.props.size}
			>
				<CornerAndPadding />

				<textlabel
					Key="OptionText"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(1, 0, 1, 0)}
					Text={this.props.optionValue}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Center}
				>
					<UnifiedTextScaler />
				</textlabel>
			</textbutton>
		);
	}
}
