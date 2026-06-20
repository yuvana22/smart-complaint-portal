// =====================================================
// Admin Controller
// Handles admin dashboard, complaint management & analytics
// =====================================================

const ComplaintModel = require('../models/complaintModel');
const AreaSectorModel = require('../models/areaSectorModel');

const AdminController = {

    // ---------- Admin Dashboard ----------
    async showDashboard(req, res) {
        try {
            const stats = await ComplaintModel.getOverallStats();
            const totalSectors = await AreaSectorModel.countSectors();
            const sectorCounts = await ComplaintModel.getSectorWiseCounts();

            res.render('admin/admin-dashboard', {
                adminUsername: req.session.adminUsername,
                stats: {
                    total: stats.total || 0,
                    pending: stats.pending || 0,
                    inProgress: stats.inProgress || 0,
                    resolved: stats.resolved || 0,
                    totalSectors: totalSectors || 0
                },
                // Data for the Sector-wise Complaint Analytics chart (Chart.js)
                chartLabels: JSON.stringify(sectorCounts.map(s => s.sector_no)),
                chartData: JSON.stringify(sectorCounts.map(s => s.count))
            });
        } catch (err) {
            console.error('Admin dashboard error:', err);
            res.status(500).send('Server error loading admin dashboard.');
        }
    },

    // ---------- Complaint Management: list with filters ----------
    async showComplaints(req, res) {
        try {
            const { search, sector, status, sort } = req.query;
            const complaints = await ComplaintModel.getAllFiltered({ search, sector, status, sort });
            const sectors = await AreaSectorModel.getAll();

            res.render('admin/manage-complaints', {
                complaints,
                sectors,
                filters: { search: search || '', sector: sector || '', status: status || '', sort: sort || 'newest' },
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (err) {
            console.error('Manage complaints error:', err);
            res.status(500).send('Server error loading complaints.');
        }
    },

    // ---------- Complaint Details ----------
    async showComplaintDetails(req, res) {
        try {
            const complaint = await ComplaintModel.findById(req.params.id);
            if (!complaint) {
                req.flash('error', 'Complaint not found.');
                return res.redirect('/admin/complaints');
            }
            res.render('admin/complaint-details', { complaint });
        } catch (err) {
            console.error('Complaint details error:', err);
            res.status(500).send('Server error loading complaint details.');
        }
    },

    // ---------- Update Complaint Status ----------
    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const validStatuses = ['Pending', 'In Progress', 'Resolved'];
            if (!validStatuses.includes(status)) {
                req.flash('error', 'Invalid status value.');
                return res.redirect('/admin/complaints');
            }
            await ComplaintModel.updateStatus(req.params.id, status);
            req.flash('success', 'Complaint status updated successfully.');
            return res.redirect('/admin/complaints');
        } catch (err) {
            console.error('Update status error:', err);
            req.flash('error', 'Failed to update status.');
            return res.redirect('/admin/complaints');
        }
    },

    // ---------- Delete Complaint ----------
    async deleteComplaint(req, res) {
        try {
            await ComplaintModel.deleteById(req.params.id);
            req.flash('success', 'Complaint deleted successfully.');
            return res.redirect('/admin/complaints');
        } catch (err) {
            console.error('Delete complaint error:', err);
            req.flash('error', 'Failed to delete complaint.');
            return res.redirect('/admin/complaints');
        }
    }
};

module.exports = AdminController;
