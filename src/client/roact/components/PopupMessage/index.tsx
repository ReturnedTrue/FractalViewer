import Roact, { Element } from "@rbxts/roact";
import { GuiService } from "@rbxts/services";
import { InterfaceMode } from "client/enums/InterfaceMode";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { clientStore } from "client/rodux/store";

const [guiInset] = GuiService.GetGuiInset();

interface PopupMessageProps {
	displayedElement: Element | false;
}

class BasePopupMessage extends Roact.Component<PopupMessageProps> {
	render() {
		if (this.props.displayedElement === false) return;

		return (
			<Roact.Fragment>
				<textbutton
					Key="PopupBackground"
					Event={{
						MouseButton1Click: () => clientStore.dispatch({ type: "closePopup" }),
					}}
					AutoButtonColor={false}
					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
					BackgroundTransparency={0.45}
					BorderSizePixel={0}
					Text=""
					Position={UDim2.fromOffset(0, -guiInset.Y)}
					Size={new UDim2(1, 0, 1, guiInset.Y)}
					ZIndex={5}
				/>

				<frame
					Key="PopupContent"
					BackgroundColor3={Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					Position={new UDim2(0.3, 0, 0.1, 0)}
					Size={new UDim2(0.4, 0, 0.7, 0)}
					ZIndex={6}
				>
					<CornerAndPadding
						paddingOverride={{
							PaddingBottom: new UDim(0.05, 0),
							PaddingLeft: new UDim(0.05, 0),
							PaddingRight: new UDim(0.05, 0),
							PaddingTop: new UDim(0.05, 0),
						}}
					/>

					{this.props.displayedElement}
				</frame>
			</Roact.Fragment>
		);
	}

	protected didUpdate(previousProps: PopupMessageProps) {}
}

export const PopupMessage = connectComponent(BasePopupMessage, (state) => {
	return {
		displayedElement: state.popup.displayedElement,
	};
});
