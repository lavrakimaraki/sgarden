import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";

const { Schema } = mongoose;

const activitySchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
		username: { type: String, required: true },
		actionType: {
			type: String,
			enum: ["login", "password_change", "profile_update", "dashboard_view"],
			required: true,
		},
		details: {
			type: Schema.Types.Mixed,
			default: {},
		},
		ipAddress: String,
		userAgent: String,
	},
	{ timestamps: true, toObject: { versionKey: false } },
);

activitySchema.plugin(mongooseLeanDefaults.default);

export default mongoose.model("activities", activitySchema);
