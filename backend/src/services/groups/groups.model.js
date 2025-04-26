import mongoose from 'mongoose';
import User from '../auth/auth.model.js';

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a group name'],
        maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please add a group description'],
        maxlength: [100, 'Description cannot be more than 500 characters'],
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {timestamps: true});

GroupSchema.index({ name: 'text' });
GroupSchema.index({ createdBy: 1 }); 
GroupSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// Enable virtuals in responses
GroupSchema.set("toJSON", { virtuals: true });

const Group = mongoose.model('Group', GroupSchema);

export default Group;