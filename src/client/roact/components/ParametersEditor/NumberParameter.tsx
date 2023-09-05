import Roact from "@rbxts/roact";
import { CoreParameterProps } from ".";
import { clientStore } from "client/rodux/store";

interface NumberParameterProps extends CoreParameterProps<number> {
	position: UDim2;

	newValueConstraint?: (newValue: number) => number;
}

export class NumberParameter extends Roact.Component<NumberParameterProps> {
	render() {
		const { name, currentValue, playerFacingName, newValueConstraint } = this.props;

		return (
			<frame
				Key={name}
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Position={this.props.position}
				Size={new UDim2(0.2, 0, 0.05, 0)}
			>
				<uicorner />
				<uipadding
					PaddingBottom={new UDim(0.1, 0)}
					PaddingLeft={new UDim(0.05, 0)}
					PaddingRight={new UDim(0.025, 0)}
					PaddingTop={new UDim(0.1, 0)}
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
				/>

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
							FocusLost: (box) => {
								let newValue = tonumber(box.Text);

								if (newValue === undefined) {
									box.Text = tostring(currentValue);
									return;
								}

								if (newValueConstraint) {
									newValue = newValueConstraint(newValue);
								}

								if (currentValue === newValue) {
									box.Text = tostring(currentValue);
									return;
								}

								clientStore.dispatch({
									type: "updateSingleParameter",
									name: name,
									value: newValue,
								});
							},
						}}
						Key="EditBox"
						Active={false}
						BackgroundTransparency={1}
						Font={Enum.Font.Ubuntu}
						Position={new UDim2(0.1, 0, 0.1, 0)}
						Selectable={false}
						Size={new UDim2(0.8, 0, 0.8, 0)}
						Text={tostring(currentValue)}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
					/>
				</frame>
			</frame>
		);
	}
}
