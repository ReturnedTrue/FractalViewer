import Roact from "@rbxts/roact";
import { CoreParameterProps } from ".";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";

interface StringInputParameterProps extends CoreParameterProps<string> {}

export class StringInputParameter extends Roact.Component<StringInputParameterProps> {
	render() {
		const { order, currentValue, playerFacingName, onNewValue } = this.props;

		const onFocusLost = (box: TextBox) => {
			const newValue = box.Text;

			if (newValue === "" || currentValue === newValue) {
				box.Text = currentValue;
				return;
			}

			onNewValue(newValue);
		};

		return (
			<frame
				Key={playerFacingName}
				LayoutOrder={order}
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
					Text={playerFacingName}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<frame
					Key="EditFrame"
					BackgroundColor3={Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					Position={new UDim2(0.5, 0, 0, 0)}
					Size={new UDim2(0.5, 0, 1, 0)}
				>
					<uicorner />

					<textbox
						Event={{
							FocusLost: onFocusLost,
						}}
						Key="EditBox"
						Active={false}
						BackgroundTransparency={1}
						ClearTextOnFocus={false}
						Font={Enum.Font.Ubuntu}
						Position={new UDim2(0.1, 0, 0.1, 0)}
						Selectable={false}
						Size={new UDim2(0.8, 0, 0.8, 0)}
						Text={tostring(currentValue)}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
					>
						<UnifiedTextScaler />
					</textbox>
				</frame>
			</frame>
		);
	}
}
