import Roact, { JsxInstanceProperties } from "@rbxts/roact";

type PaddingData = Omit<JsxInstanceProperties<UIPadding>, "Archivable">;

interface CornerAndPaddingProps {
	paddingOverride?: PaddingData;
}

const defaultPaddingData = {
	PaddingBottom: new UDim(0.1, 0),
	PaddingLeft: new UDim(0.1, 0),
	PaddingRight: new UDim(0.1, 0),
	PaddingTop: new UDim(0.1, 0),
} satisfies Required<PaddingData>;

export class CornerAndPadding extends Roact.Component<CornerAndPaddingProps> {
	render() {
		return (
			<Roact.Fragment>
				<uicorner />

				<uipadding {...defaultPaddingData} {...this.props.paddingOverride} />
			</Roact.Fragment>
		);
	}
}
