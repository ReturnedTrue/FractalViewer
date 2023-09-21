import Roact from "@rbxts/roact";
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
		const { ref, position, size, optionValue, onSelected } = this.props;

		return (
			<textbutton
				Key="OptionFrame"
				Ref={ref}
				Event={{
					MouseButton1Click: () => onSelected(optionValue),
				}}
				BackgroundColor3={Color3.fromRGB(52, 52, 52)}
				BorderSizePixel={0}
				Position={position}
				Size={size}
			>
				<uicorner />
				<uipadding
					PaddingBottom={new UDim(0.1, 0)}
					PaddingLeft={new UDim(0.1, 0)}
					PaddingRight={new UDim(0.1, 0)}
					PaddingTop={new UDim(0.1, 0)}
				/>
				<textlabel
					Key="OptionText"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(1, 0, 1, 0)}
					Text={optionValue}
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
